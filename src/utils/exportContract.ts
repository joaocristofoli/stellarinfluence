import { Company, MarketingStrategy } from '@/types/marketing';

export function exportContract(company: Company, strategies: MarketingStrategy[], agencyName: string = "STELLAR INFLUENCE STUDIO") {
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
            year: 'numeric'
        });
    };

    const strategiesList = strategies.map((s, index) => `
        <div class="strategy-item">
            <strong>${index + 1}. ${s.name}</strong><br/>
            Canal: ${s.channelType}<br/>
            Valor: ${formatCurrency(s.budget)}<br/>
            Descrição: ${s.description}
        </div>
    `).join('');

    const contractHtml = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; line-height: 1.6; color: #333; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { text-align: center; margin-bottom: 40px; font-size: 24px; text-transform: uppercase; }
            h2 { font-size: 16px; margin-top: 30px; margin-bottom: 15px; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
            p { margin-bottom: 15px; text-align: justify; }
            .strategy-item { margin-bottom: 15px; padding: 10px; background: #f9f9f9; border-radius: 5px; }
            .signature-block { margin-top: 60px; display: flex; justify-content: space-between; gap: 40px; }
            .signature-line { border-top: 1px solid #000; padding-top: 10px; text-align: center; flex: 1; margin-top: 40px; }
            
            @media print {
                body { padding: 0; }
                .page-break { page-break-before: always; }
            }
        </style>
    </head>
    <body>
        <h1>CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE MARKETING</h1>

        <h2>1. DAS PARTES</h2>
        <p>
            <strong>CONTRATADA:</strong> ${agencyName}, pessoa jurídica de direito privado.<br/>
            <strong>CONTRATANTE:</strong> <strong>${company.name.toUpperCase()}</strong>, 
            ${company.cnpj ? `inscrita no CNPJ sob nº ${company.cnpj},` : ''}
            ${company.address ? `com sede em ${company.address},` : ''}
            neste ato representada por <strong>${company.representativeName || '____________________'}</strong>
            ${company.representativeRole ? `(${company.representativeRole})` : ''}.
        </p>

        <h2>2. DO OBJETO</h2>
        <p>
            O presente contrato tem por objeto a prestação de serviços de planejamento e execução de estratégias de marketing, conforme detalhado abaixo:
        </p>
        ${strategiesList}

        <h2>3. DO VALOR E FORMA DE PAGAMENTO</h2>
        <p>
            Pelos serviços prestados, a CONTRATANTE pagará à CONTRATADA o valor total de <strong>${formatCurrency(totalBudget)}</strong>.
        </p>

        <h2>4. DO PRAZO</h2>
        <p>
            O presente contrato entra em vigor na data de sua assinatura e terá vigência até a conclusão das estratégias estipuladas.
        </p>

        <h2>5. DO FORO</h2>
        <p>
            Fica eleito o foro da Comarca de ${company.city || 'Toledo/PR'} para dirimir quaisquer dúvidas oriundas deste contrato.
        </p>

        <p style="margin-top: 40px; text-align: center;">
            ${company.city || 'Toledo'}, ${formatDate(new Date())}.
        </p>

        <div class="signature-block">
            <div class="signature-line">
                <strong>${agencyName}</strong><br/>
                Contratada
            </div>
            <div class="signature-line">
                <strong>${company.name}</strong><br/>
                ${company.representativeName || 'Representante Legal'}<br/>
                Contratante
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
    }
}
