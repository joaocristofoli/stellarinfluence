import { MarketingStrategy, Company } from '../types/marketing';
import { formatCurrency } from '@/utils/formatters';

interface ContractParties {
    agencyName: string;
    agencyCNPJ: string;
    agencyAddress: string;
    agencyRepresentative: string;
    agencyRepresentativeCPF: string;
}

const AGENCY_INFO: ContractParties = {
    agencyName: 'AGÊNCIA ETERNIZAR',
    agencyCNPJ: '60.463.723/0001-59',
    agencyAddress: 'Toledo - PR',
    agencyRepresentative: 'João Vítor da Silva Christofoli',
    agencyRepresentativeCPF: '069.468.159-80',
};

export const generateDefaultContract = (
    company: Company,
    strategies: MarketingStrategy[],
    agencyName: string = AGENCY_INFO.agencyName
) => {
    const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);
    // formatCurrency removido - usar import de @/utils/formatters

    const strategiesList = strategies
        .map(
            (s, index) =>
                `${index + 1}. ${s.name} (${s.channelType}) - ${formatCurrency(s.budget)}\n   Descrição: ${s.description}`
        )
        .join('\n\n');

    const currentDate = new Date();
    const vigenciaDate = new Date(currentDate);
    vigenciaDate.setMonth(vigenciaDate.getMonth() + 12); // 12 meses de vigência

    return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING DIGITAL

PELO PRESENTE INSTRUMENTO PARTICULAR, celebram entre si:

1. DAS PARTES

CONTRATADA: ${AGENCY_INFO.agencyName}, pessoa jurídica de direito privado, inscrita no CNPJ sob nº ${AGENCY_INFO.agencyCNPJ}, com sede em ${AGENCY_INFO.agencyAddress}, neste ato representada por ${AGENCY_INFO.agencyRepresentative}, portador do CPF nº ${AGENCY_INFO.agencyRepresentativeCPF}, doravante denominada simplesmente CONTRATADA.

CONTRATANTE: ${company.name.toUpperCase()}, ${company.cnpj ? `inscrita no CNPJ sob nº ${company.cnpj},` : 'pessoa jurídica de direito privado,'} ${company.address ? `com sede em ${company.address},` : ''} neste ato representada por ${company.representativeName || '____________________'} ${company.representativeRole ? `(${company.representativeRole})` : ''}, doravante denominada simplesmente CONTRATANTE.

2. DO OBJETO

2.1. O presente contrato tem por objeto a prestação de serviços de marketing digital pela CONTRATADA em favor da CONTRATANTE, compreendendo as seguintes atividades:

${strategiesList}

2.2. Os serviços compreendem obrigação de MEIO, e não de resultado, comprometendo-se a CONTRATADA a empregar os melhores esforços, técnicas e conhecimentos para alcançar os objetivos estabelecidos.

2.3. A CONTRATADA não garante resultados específicos de vendas, faturamento ou metas quantitativas, uma vez que tais resultados dependem de fatores externos e de mercado fora do controle da agência.

3. DO VALOR E FORMA DE PAGAMENTO

3.1. Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor total de ${formatCurrency(totalBudget)} (___________________).

3.2. O pagamento será realizado mensalmente, até o dia 05 (cinco) do mês subsequente ao da prestação dos serviços, mediante apresentação de nota fiscal.

3.3. Em caso de atraso no pagamento, serão aplicados juros de mora de 1% (um por cento) ao mês e multa de 2% (dois por cento) sobre o valor em atraso.

3.4. Eventuais investimentos em mídia paga (Google Ads, Facebook Ads, Instagram Ads, etc.) serão cobrados separadamente e deverão ser pré-aprovados pela CONTRATANTE.

4. DO PRAZO E VIGÊNCIA

4.1. O presente contrato entra em vigor na data de sua assinatura e terá vigência de 12 (doze) meses, até ${vigenciaDate.toLocaleDateString('pt-BR')}.

4.2. O contrato poderá ser renovado automaticamente por períodos sucessivos de 12 (doze) meses, salvo manifestação expressa em contrário de qualquer das partes, com antecedência mínima de 30 (trinta) dias do término da vigência.

5. DA RESCISÃO

5.1. Qualquer das partes poderá rescindir o presente contrato mediante comunicação por escrito com antecedência mínima de 30 (trinta) dias.

5.2. Em caso de rescisão antecipada por parte da CONTRATANTE, sem justa causa, será devida multa rescisória correspondente a 50% (cinquenta por cento) do valor total remanescente do contrato.

5.3. A CONTRATADA poderá rescindir imediatamente o contrato, sem qualquer ônus, em caso de:
   a) Inadimplência da CONTRATANTE por período superior a 15 (quinze) dias;
   b) Descumprimento de quaisquer cláusulas contratuais pela CONTRATANTE;
   c) Falta de fornecimento de informações essenciais para execução dos serviços.

6. DAS OBRIGAÇÕES DA CONTRATADA

6.1. Executar os serviços contratados com qualidade técnica, zelo profissional e em conformidade com as melhores práticas do mercado.

6.2. Fornecer relatórios mensais de desempenho das campanhas, contendo métricas relevantes e análises.

6.3. Manter sigilo absoluto sobre todas as informações confidenciais da CONTRATANTE.

6.4. Cumprir integralmente a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) no tratamento de dados pessoais.

6.5. Realizar reuniões periódicas de alinhamento com a CONTRATANTE, conforme acordado.

7. DAS OBRIGAÇÕES DA CONTRATANTE

7.1. Efetuar os pagamentos nas datas acordadas.

7.2. Fornecer todas as informações, acessos, materiais e autorizações necessárias para a execução dos serviços.

7.3. Aprovar ou reprovar peças e materiais no prazo de 5 (cinco) dias úteis. Após este prazo sem manifestação, considerar-se-á aprovado tacitamente.

7.4. Garantir que possui os direitos necessários sobre materiais, marcas e conteúdos fornecidos à CONTRATADA.

7.5. Respeitar o prazo mínimo de antecedência para solicitação de alterações nos serviços contratados.

8. DA PROPRIEDADE INTELECTUAL E DIREITOS AUTORAIS

8.1. Todo conteúdo produzido pela CONTRATADA (textos, imagens, vídeos, artes, estratégias) é protegido pela Lei de Direitos Autorais (Lei nº 9.610/1998).

8.2. Os direitos patrimoniais sobre o material produzido serão automaticamente transferidos à CONTRATANTE mediante o pagamento integral dos serviços.

8.3. A CONTRATADA reserva-se o direito de incluir os trabalhos realizados em seu portfólio, salvo acordo em contrário.

8.4. A CONTRATANTE não poderá reutilizar, modificar ou comercializar templates, layouts ou códigos fornecidos pela CONTRATADA sem autorização expressa.

9. DA CONFIDENCIALIDADE

9.1. As partes comprometem-se a manter sigilo sobre todas as informações confidenciais trocadas durante a vigência do contrato.

9.2. Consideram-se confidenciais: estratégias de negócio, dados financeiros, listas de clientes, processos internos, senhas de acesso e quaisquer informações não públicas.

9.3. A obrigação de confidencialidade permanecerá válida por 5 (cinco) anos após o término do contrato.

9.4. A violação da confidencialidade ensejará reparação por perdas e danos.

10. DA PROTEÇÃO DE DADOS PESSOAIS (LGPD)

10.1. As partes declaram conhecer e se comprometer com o cumprimento da Lei Geral de Proteção de Dados (Lei nº 13.709/2018).

10.2. A CONTRATANTE atua como CONTROLADORA dos dados pessoais de seus clientes e a CONTRATADA como OPERADORA.

10.3. A CONTRATADA compromete-se a:
   a) Tratar os dados pessoais apenas para as finalidades autorizadas pela CONTRATANTE;
   b) Implementar medidas de segurança técnicas e administrativas adequadas;
   c) Não compartilhar dados pessoais com terceiros sem autorização expressa;
   d) Notificar imediatamente a CONTRATANTE em caso de incidentes de segurança;
   e) Eliminar os dados pessoais ao término do contrato, salvo obrigação legal.

10.4. Qualquer vazamento, perda ou uso indevido de dados pessoais poderá acarretar responsabilização civil, administrativa e criminal conforme a LGPD.

11. DO USO DE IMAGEM E PARCERIAS

11.1. Caso sejam contratados influenciadores, fotógrafos ou outros parceiros, todas as autorizações de uso de imagem deverão ser formalizadas por escrito.

11.2. A CONTRATADA não se responsabiliza por uso de imagem não autorizado se a CONTRATANTE forneceu o material sem as devidas liberações.

12. DAS APROVAÇÕES E ALTERAÇÕES

12.1. Todas as peças e materiais criados serão submetidos à aprovação da CONTRATANTE.

12.2. A CONTRATANTE terá até 2 (duas) rodadas de ajustes sem custo adicional por peça. Alterações posteriores poderão ser cobradas separadamente.

12.3. Alterações substanciais no escopo do projeto poderão acarretar reajuste nos valores contratados.

13. DA RESPONSABILIDADE E LIMITAÇÃO

13.1. A CONTRATADA não se responsabiliza por:
   a) Resultados de vendas ou faturamento da CONTRATANTE;
   b) Alterações em algoritmos de plataformas (Google, Facebook, Instagram, etc.);
   c) Danos causados por informações incorretas fornecidas pela CONTRATANTE;
   d) Indisponibilidade de plataformas de terceiros;
   e) Conteúdos ou materiais fornecidos pela CONTRATANTE que violem direitos de terceiros.

13.2. A responsabilidade total da CONTRATADA fica limitada ao valor total pago pela CONTRATANTE nos últimos 6 (seis) meses.

14. DO REAJUSTE

14.1. Os valores contratuais serão reajustados anualmente pelo índice IPCA (Índice de Preços ao Consumidor Amplo) ou outro índice que venha a substituí-lo.

15. DAS DISPOSIÇÕES GERAIS

15.1. O presente contrato substitui todos os acordos anteriores, verbais ou escritos, entre as partes.

15.2. Qualquer alteração neste contrato deverá ser formalizada por escrito e assinada por ambas as partes.

15.3. A tolerância de uma parte com o descumprimento da outra não implica em renúncia de direitos.

15.4. Se qualquer cláusula for considerada inválida, as demais permanecerão em vigor.

15.5. Este contrato vincula as partes, seus sucessores e cessionários.

16. DO FORO

16.1. Fica eleito o foro da Comarca de ${company.city || 'Toledo/PR'} para dirimir quaisquer dúvidas ou controvérsias oriundas deste contrato, com renúncia expressa a qualquer outro, por mais privilegiado que seja.

E, por estarem assim justas e contratadas, as partes assinam o presente instrumento em 2 (duas) vias de igual teor e forma, na presença de 2 (duas) testemunhas.

${company.city || 'Toledo'}, ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}.`;
};
