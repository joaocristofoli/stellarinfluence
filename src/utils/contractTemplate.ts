import { MarketingStrategy, Company } from '../types/marketing';

export const generateDefaultContract = (company: Company, strategies: MarketingStrategy[], agencyName: string) => {
    const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);
    const formatCurrency = (value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

    const strategiesList = strategies.map((s, index) =>
        `${index + 1}. ${s.name} (${s.channelType}) - ${formatCurrency(s.budget)}\n   Descrição: ${s.description}`
    ).join('\n\n');

    return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING

1. DAS PARTES
CONTRATADA: ${agencyName}, pessoa jurídica de direito privado.
CONTRATANTE: ${company.name.toUpperCase()}, ${company.cnpj ? `inscrita no CNPJ sob nº ${company.cnpj},` : ''} ${company.address ? `com sede em ${company.address},` : ''} neste ato representada por ${company.representativeName || '____________________'} ${company.representativeRole ? `(${company.representativeRole})` : ''}.

2. DO OBJETO
O presente contrato tem por objeto a prestação de serviços de planejamento e execução de estratégias de marketing, conforme detalhado abaixo:

${strategiesList}

3. DO VALOR E FORMA DE PAGAMENTO
Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor total de ${formatCurrency(totalBudget)}.

4. DO PRAZO
O presente contrato entra em vigor na data de sua assinatura e terá vigência até a conclusão das estratégias estipuladas.

5. DAS OBRIGAÇÕES
I - A CONTRATADA compromete-se a executar os serviços com zelo e qualidade técnica.
II - A CONTRATANTE compromete-se a fornecer as informações e acessos necessários para a execução do serviço.

6. DO FORO
Fica eleito o foro da Comarca de ${company.city || 'Toledo/PR'} para dirimir quaisquer dúvidas oriundas deste contrato.

${company.city || 'Toledo'}, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.
`;
};
