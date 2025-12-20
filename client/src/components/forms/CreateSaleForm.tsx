import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export function CreateSaleForm() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    totalAmount: "",
    status: "pending",
    saleDate: "",
  });

  const createSale = trpc.sales.create.useMutation({
    onSuccess: () => {
      toast.success("Sale created successfully");
      setOpen(false);
      setFormData({
        clientId: "",
        totalAmount: "",
        status: "pending",
        saleDate: "",
      });
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create sale");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createSale.mutate({
      ...formData,
      clientId: formData.clientId,
      totalAmount: parseFloat(formData.totalAmount).toString() || "0",
      status: formData.status as "pending" | "completed" | "cancelled",
      items: [], // TODO: Add proper items handling
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:opacity-90">
          <Plus className="h-4 w-4 mr-2" />
          Add Sale
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Sale</DialogTitle>
          <DialogDescription>
            Enter the sale's information below. All fields marked with * are
            required.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="clientId">Client ID *</Label>
            <Input
              id="clientId"
              type="number"
              min="1"
              value={formData.clientId}
              onChange={(e) => handleInputChange("clientId", e.target.value)}
              required
              placeholder="Enter client ID"
            />
          </div>

          <div>
            <Label htmlFor="totalAmount">Total Amount *</Label>
            <Input
              id="totalAmount"
              type="number"
              step="0.01"
              min="0"
              value={formData.totalAmount}
              onChange={(e) => handleInputChange("totalAmount", e.target.value)}
              required
              placeholder="0.00"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => handleInputChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="saleDate">Sale Date *</Label>
            <Input
              id="saleDate"
              type="date"
              value={formData.saleDate}
              onChange={(e) => handleInputChange("saleDate", e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createSale.isPending}>
              {createSale.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Sale"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
