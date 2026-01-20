import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { CreatorsTable } from "@/components/admin/CreatorsTable";
import { MergeProfilesDialog } from "@/components/admin/MergeProfilesDialog";
import { Plus } from "lucide-react";

export default function CreatorsPage() {
    const navigate = useNavigate();

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold">Parceiros de Mídia</h2>
                    <p className="text-muted-foreground">Gerencie influenciadores, imprensa, outdoor e outros parceiros</p>
                </div>
                <div className="flex gap-2">
                    <MergeProfilesDialog />
                    <Button onClick={() => navigate("/admin/creators/new")} className="bg-accent hover:bg-accent/90 btn-glow shadow-lg shadow-accent/20">
                        <Plus className="w-4 h-4 mr-2" />
                        Novo Parceiro
                    </Button>
                </div>
            </div>

            {/* Table Container with Luxury Styles applies in the Table component itself, 
          but adding a wrapper for layout if needed */}
            <CreatorsTable />
        </div>
    );
}
