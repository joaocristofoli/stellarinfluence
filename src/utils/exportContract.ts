import { Company, MarketingStrategy } from '@/types/marketing';

const AGENCY_INFO = {
    name: 'AGÊNCIA ETERNIZAR',
    cnpj: '60.463.723/0001-59',
    address: 'Toledo - PR',
    representative: 'João Vítor da Silva Christofoli',
    cpf: '069.468.159-80',
};

export function exportContract(
    company: Company,
    strategies: MarketingStrategy[],
    agencyName: string = AGENCY_INFO.name
) {
    const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const currentDate = new Date();
    const vigenciaDate = new Date(currentDate);
    vigenciaDate.setMonth(vigenciaDate.getMonth() + 12);

    const strategiesList = strategies
        .map(
            (s, index) => `
        <div class="strategy-item">
            <strong>${index + 1}. ${s.name}</strong> (${s.channelType})<br/>
            <strong>Valor:</strong> ${formatCurrency(s.budget)}<br/>
            <strong>Descrição:</strong> ${s.description}
        </div>
    `
        )
        .join('');

    const contractHtml = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contrato de Prestação de Serviços - ${company.name}</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Inter', Arial, sans-serif;
                line-height: 1.8;
                color: #1a1a1a;
                padding: 60px 40px;
                max-width: 900px;
                margin: 0 auto;
                background: white;
            }
            
            h1 {
                text-align: center;
                margin-bottom: 50px;
                font-size: 22px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                color: #000;
                border-bottom: 3px solid #8b5cf6;
                padding-bottom: 20px;
            }
            
            h2 {
                font-size: 14px;
                font-weight: 700;
                margin-top: 35px;
                margin-bottom: 15px;
                color: #000;
                text-transform: uppercase;
                border-bottom: 2px solid #e5e7eb;
                padding-bottom: 8px;
                letter-spacing: 0.3px;
            }
            
            h3 {
                font-size: 12px;
                font-weight: 600;
                margin-top: 20px;
                margin-bottom: 10px;
                color: #374151;
            }
            
            p, li {
                margin-bottom: 12px;
                text-align: justify;
                font-size: 11px;
                color: #1f2937;
            }
            
            .intro {
                font-style: italic;
                margin-bottom: 30px;
                text-align: center;
                font-size: 12px;
                color: #6b7280;
            }
            
            .parties {
                background: #f9fafb;
                padding: 20px;
                border-left: 4px solid #8b5cf6;
                margin-bottom: 30px;
                border-radius: 4px;
            }
            
            .parties p {
                margin-bottom: 15px;
                line-height: 1.9;
            }
            
            .strategy-item {
                margin-bottom: 15px;
                padding: 15px;
                background: #f9fafb;
                border-radius: 6px;
                border-left: 3px solid #8b5cf6;
                font-size: 11px;
            }
            
            .strategy-item strong {
                color: #8b5cf6;
            }
            
            ul {
                margin-left: 30px;
                margin-top: 10px;
                margin-bottom: 20px;
            }
            
            li {
                margin-bottom: 8px;
                list-style-type: lower-alpha;
            }
            
            .subsection {
                margin-left: 20px;
                margin-top: 10px;
            }
            
            .highlight {
                background: #fef3c7;
                padding: 2px 6px;
                border-radius: 3px;
                font-weight: 600;
            }
            
            .signature-block {
                margin-top: 80px;
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 60px;
                page-break-inside: avoid;
            }
            
            .signature-line {
                border-top: 2px solid #000;
                padding-top: 15px;
                text-align: center;
                margin-top: 60px;
            }
            
            .signature-line strong {
                display: block;
                margin-bottom: 5px;
                font-size: 12px;
                color: #000;
            }
            
            .signature-line small {
                font-size: 10px;
                color: #6b7280;
            }
            
            .date-location {
                margin-top: 50px;
                text-align: center;
                font-size: 12px;
                font-weight: 600;
                color: #374151;
            }
            
            .witnesses {
                margin-top: 60px;
                page-break-inside: avoid;
            }
            
            .witnesses h3 {
                text-align: center;
                margin-bottom: 30px;
            }
            
            .witness-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 40px;
                margin-top: 20px;
            }
            
            .witness-line {
                border-top: 1px solid #6b7280;
                padding-top: 10px;
                text-align: center;
                margin-top: 50px;
                font-size: 10px;
            }
            
            @media print {
                body {
                    padding: 30px;
                    max-width: 100%;
                }
                
                .page-break {
                    page-break-before: always;
                }
                
                h2 {
                    page-break-after: avoid;
                }
                
                .signature-block,
                .witnesses {
                    page-break-inside: avoid;
                }
            }
        </style>
    </head>
    <body>
        <h1>Contrato de Prestação de Serviços de Marketing Digital</h1>
        
        <p class="intro">
            PELO PRESENTE INSTRUMENTO PARTICULAR, celebram entre si:
        </p>

        <div class="parties">
            <p>
                <strong>CONTRATADA:</strong> ${AGENCY_INFO.name}, pessoa jurídica de direito privado, 
                inscrita no CNPJ sob nº <strong>${AGENCY_INFO.cnpj}</strong>, com sede em <strong>${AGENCY_INFO.address}</strong>, 
                neste ato representada por <strong>${AGENCY_INFO.representative}</strong>, portador do CPF nº 
                <strong>${AGENCY_INFO.cpf}</strong>, doravante denominada simplesmente CONTRATADA.
            </p>
            <p>
                <strong>CONTRATANTE:</strong> <strong>${company.name.toUpperCase()}</strong>, 
                ${company.cnpj ? `inscrita no CNPJ sob nº <strong>${company.cnpj}</strong>,` : 'pessoa jurídica de direito privado,'} 
                ${company.address ? `com sede em <strong>${company.address}</strong>,` : ''} 
                neste ato representada por <strong>${company.representativeName || '____________________'}</strong> 
                ${company.representativeRole ? `(${company.representativeRole})` : ''}, 
                doravante denominada simplesmente CONTRATANTE.
            </p>
        </div>

        <h2>1. Do Objeto</h2>
        <p>
            1.1. O presente contrato tem por objeto a prestação de serviços de marketing digital pela CONTRATADA 
            em favor da CONTRATANTE, compreendendo as seguintes atividades:
        </p>
        ${strategiesList}
        <p>
            1.2. Os serviços compreendem <span class="highlight">obrigação de MEIO</span>, e não de resultado, 
            comprometendo-se a CONTRATADA a empregar os melhores esforços, técnicas e conhecimentos para alcançar 
            os objetivos estabelecidos.
        </p>
        <p>
            1.3. A CONTRATADA não garante resultados específicos de vendas, faturamento ou metas quantitativas, 
            uma vez que tais resultados dependem de fatores externos e de mercado fora do controle da agência.
        </p>

        <h2>2. Do Valor e Forma de Pagamento</h2>
        <p>
            2.1. Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor total de 
            <strong>${formatCurrency(totalBudget)}</strong>.
        </p>
        <p>
            2.2. O pagamento será realizado mensalmente, até o dia 05 (cinco) do mês subsequente ao da prestação 
            dos serviços, mediante apresentação de nota fiscal.
        </p>
        <p>
            2.3. Em caso de atraso no pagamento, serão aplicados juros de mora de 1% (um por cento) ao mês e 
            multa de 2% (dois por cento) sobre o valor em atraso.
        </p>
        <p>
            2.4. Eventuais investimentos em mídia paga (Google Ads, Facebook Ads, Instagram Ads, etc.) serão 
            cobrados separadamente e deverão ser pré-aprovados pela CONTRATANTE.
        </p>

        <h2>3. Do Prazo e Vigência</h2>
        <p>
            3.1. O presente contrato entra em vigor na data de sua assinatura e terá vigência de <strong>12 (doze) meses</strong>, 
            até <strong>${formatDate(vigenciaDate)}</strong>.
        </p>
        <p>
            3.2. O contrato poderá ser renovado automaticamente por períodos sucessivos de 12 (doze) meses, 
            salvo manifestação expressa em contrário de qualquer das partes, com antecedência mínima de 30 (trinta) dias 
            do término da vigência.
        </p>

        <h2>4. Da Rescisão</h2>
        <p>
            4.1. Qualquer das partes poderá rescindir o presente contrato mediante comunicação por escrito com 
            antecedência mínima de 30 (trinta) dias.
        </p>
        <p>
            4.2. Em caso de rescisão antecipada por parte da CONTRATANTE, sem justa causa, será devida multa 
            rescisória correspondente a 50% (cinquenta por cento) do valor total remanescente do contrato.
        </p>
        <p>
            4.3. A CONTRATADA poderá rescindir imediatamente o contrato, sem qualquer ônus, em caso de:
        </p>
        <ul>
            <li>Inadimplência da CONTRATANTE por período superior a 15 (quinze) dias;</li>
            <li>Descumprimento de quaisquer cláusulas contratuais pela CONTRATANTE;</li>
            <li>Falta de fornecimento de informações essenciais para execução dos serviços.</li>
        </ul>

        <div class="page-break"></div>

        <h2>5. Das Obrigações da Contratada</h2>
        <p>5.1. Executar os serviços com qualidade técnica e zelo profissional.</p>
        <p>5.2. Fornecer relatórios mensais de desempenho das campanhas.</p>
        <p>5.3. Manter sigilo sobre informações confidenciais da CONTRATANTE.</p>
        <p>5.4. Cumprir a LGPD (Lei nº 13.709/2018) no tratamento de dados pessoais.</p>

        <h2>6. Das Obrigações da Contratante</h2>
        <p>6.1. Efetuar os pagamentos nas datas acordadas.</p>
        <p>6.2. Fornecer informações, acessos e materiais necessários.</p>
        <p>6.3. Aprovar ou reprovar materiais em até 5 (cinco) dias úteis.</p>
        <p>6.4. Garantir direitos sobre materiais fornecidos.</p>

        <h2>7. Da Propriedade Intelectual</h2>
        <p>
            7.1. Os direitos patrimoniais sobre o material produzido serão transferidos à CONTRATANTE 
            mediante pagamento integral dos serviços, conforme Lei nº 9.610/1998.
        </p>
        <p>
            7.2. A CONTRATADA reserva-se o direito de incluir os trabalhos em seu portfólio.
        </p>

        <h2>8. Da Confidencialidade</h2>
        <p>
            8.1. As partes comprometem-se a manter sigilo sobre informações confidenciais por 5 (cinco) anos 
            após o término do contrato.
        </p>

        <h2>9. Da Proteção de Dados (LGPD)</h2>
        <p>
            9.1. A CONTRATANTE atua como CONTROLADORA e a CONTRATADA como OPERADORA de dados pessoais.
        </p>
        <p>
            9.2. A CONTRATADA compromete-se a tratar dados apenas para finalidades autorizadas, implementar 
            medidas de segurança e notificar imediatamente em caso de incidentes.
        </p>

        <h2>10. Da Responsabilidade</h2>
        <p>
            10.1. A CONTRATADA não se responsabiliza por resultados de vendas, alterações em algoritmos, 
            informações incorretas fornecidas ou indisponibilidade de plataformas de terceiros.
        </p>
        <p>
            10.2. A responsabilidade total da CONTRATADA fica limitada ao valor pago nos últimos 6 (seis) meses.
        </p>

        <h2>11. Do Reajuste</h2>
        <p>
            11.1. Os valores serão reajustados anualmente pelo IPCA.
        </p>

        <h2>12. Do Foro</h2>
        <p>
            12.1. Fica eleito o foro da Comarca de <strong>${company.city || 'Toledo/PR'}</strong> para dirimir 
            quaisquer controvérsias, com renúncia expressa a qualquer outro.
        </p>

        <p class="date-location">
            ${company.city || 'Toledo'}, ${formatDate(currentDate)}.
        </p>

        <div class="signature-block">
            <div class="signature-line">
                <strong>${AGENCY_INFO.name}</strong>
                <small>CNPJ: ${AGENCY_INFO.cnpj}</small><br/>
                <small>${AGENCY_INFO.representative}</small><br/>
                <small>CPF: ${AGENCY_INFO.cpf}</small><br/>
                <small>Contratada</small>
            </div>
            <div class="signature-line">
                <strong>${company.name.toUpperCase()}</strong>
                ${company.cnpj ? `<small>CNPJ: ${company.cnpj}</small><br/>` : ''}
                <small>${company.representativeName || 'Representante Legal'}</small><br/>
                <small>Contratante</small>
            </div>
        </div>

        <div class="witnesses">
            <h3>TESTEMUNHAS</h3>
            <div class="witness-grid">
                <div class="witness-line">
                    <strong>1ª Testemunha</strong><br/>
                    Nome: _________________________________<br/>
                    CPF: __________________________________<br/>
                    Assinatura: ___________________________
                </div>
                <div class="witness-line">
                    <strong>2ª Testemunha</strong><br/>
                    Nome: _________________________________<br/>
                    CPF: __________________________________<br/>
                    Assinatura: ___________________________
                </div>
            </div>
        </div>
    </body>
    </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(contractHtml);
        printWindow.document.close();
        printWindow.onload = () => {
            printWindow.print();
        };
    } else {
        alert('Por favor, permita pop-ups para gerar o contrato.');
    }
}
