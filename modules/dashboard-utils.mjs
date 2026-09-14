export function normalizarStatusViatura(status) {
    const valor = String(status || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim()
        .toUpperCase();

    if (["LIVRE", "DISPONIVEL", "DISPONÍVEL"].includes(valor)) {
        return "LIVRE";
    }

    if (["EM USO", "EM_USO", "USO", "EM OPERACAO", "EM OPERAÇÃO"].includes(valor)) {
        return "EM USO";
    }

    if (["MANUTENCAO", "MANUTENÇÃO", "EM MANUTENCAO", "EM MANUTENÇÃO"].includes(valor)) {
        return "MANUTENCAO";
    }

    if (["BAIXADA", "BAIXADO", "BAIXA", "INATIVA"].includes(valor)) {
        return "BAIXADA";
    }

    return "OUTRO";
}

export function contarViaturasPorStatus(viaturas = []) {
    const totais = {
        livres: 0,
        emUso: 0,
        manutencao: 0,
        baixadas: 0,
        outros: 0
    };

    viaturas.forEach((viatura) => {
        const status = normalizarStatusViatura(viatura?.status);

        switch (status) {
            case "LIVRE":
                totais.livres++;
                break;
            case "EM USO":
                totais.emUso++;
                break;
            case "MANUTENCAO":
                totais.manutencao++;
                break;
            case "BAIXADA":
                totais.baixadas++;
                break;
            default:
                totais.outros++;
        }
    });

    return totais;
}

export function converterParaData(valor) {
    if (!valor) {
        return null;
    }

    if (valor.toDate) {
        try {
            return valor.toDate();
        } catch (error) {
            return null;
        }
    }

    if (valor instanceof Date) {
        return valor;
    }

    if (typeof valor === "string") {
        const data = new Date(valor);
        return isNaN(data.getTime()) ? null : data;
    }

    if (typeof valor === "number") {
        const data = new Date(valor);
        return isNaN(data.getTime()) ? null : data;
    }

    return null;
}
