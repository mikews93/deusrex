import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface DeletePatientButtonProps {
  patientId: string;
  patientName: string;
  trigger?: React.ReactNode;
}

export function DeletePatientButton({
  patientId,
  patientName,
  trigger,
}: DeletePatientButtonProps) {
  const [open, setOpen] = useState(false);
  const utils = trpc.useUtils();

  const deletePatient = trpc.patients.delete.useMutation({
    onSuccess: () => {
      toast.success("Patient deleted successfully");
      setOpen(false);
      utils.patients.getAll.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete patient");
    },
  });

  const handleDelete = () => {
    deletePatient.mutate({ id: patientId });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger || (
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the
            patient <strong>{patientName}</strong> and all associated data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deletePatient.isPending}
            className="bg-red-600 hover:bg-red-700"
          >
            {deletePatient.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete Patient"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
