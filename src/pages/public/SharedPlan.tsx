import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Clock, AlertCircle } from 'lucide-react';
import { getSharedPlan, SharedPlanData } from '@/utils/shareableLink';
import { generatePlanHtml } from '@/utils/exportPdf';

export default function SharedPlan() {
    const { id } = useParams<{ id: string }>();
    const [loading, setLoading] = useState(true);
    const [plan, setPlan] = useState<SharedPlanData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadPlan() {
            if (!id) {
                setError('Link inválido');
                setLoading(false);
                return;
            }

            try {
                const data = await getSharedPlan(id);
                if (!data) {
                    setError('expired');
                } else {
                    setPlan(data);
                }
            } catch (err) {
                console.error('Error loading shared plan:', err);
                setError('Erro ao carregar o planejamento');
            } finally {
                setLoading(false);
            }
        }

        loadPlan();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600 mx-auto mb-4" />
                    <p className="text-gray-600">Carregando planejamento...</p>
                </div>
            </div>
        );
    }

    if (error === 'expired') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-8 h-8 text-orange-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Link Expirado
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Este link de compartilhamento expirou após 24 horas.
                        Solicite um novo link ao responsável pelo planejamento.
                    </p>
                    <div className="text-sm text-gray-500">
                        Links compartilhados são válidos por 24 horas por segurança.
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-8 h-8 text-red-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Erro
                    </h1>
                    <p className="text-gray-600">
                        {error}
                    </p>
                </div>
            </div>
        );
    }

    if (!plan) return null;

    // Render the plan HTML directly
    const html = generatePlanHtml(plan.strategiesData, plan.companyData);

    return (
        <div
            className="shared-plan-container"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
