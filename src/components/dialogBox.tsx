import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
  } from "@/components/ui/dialog"

  import { Input } from "@/components/ui/input"
  import { Label } from "@/components/ui/label"

  import { Button } from "@/components/ui/button"
  import { addService as useAddService, updateService as useUpdateService } from "@/hooks/useService"
  import { toast } from 'sonner'
  import { useEffect, useState } from "react"
  import { serviceType } from "@/hooks/useService"
  import { useServiceModalStore } from "@/store/serviceModalStore"
  
  export function AddServiceDialog() {
    const {
        isOpen,
        mode,
        initialData,
        close,
      } = useServiceModalStore();

    
    const [serviceName, setServiceName] = useState('')
    const [serviceType, setServiceType] = useState<serviceType>()

    const addMutation = useAddService()
    const updateMutation = useUpdateService();

    useEffect(() => {
        if (mode === "edit" && initialData) {
          setServiceName(initialData.name);
          setServiceType(initialData.type);
        } else {
          setServiceName('');
          setServiceType(undefined);
        }
        console.log("dialog")
      }, [mode, initialData]);

    // const handleAddService = () => {
        
    //   const newService = {
    //     name: serviceName,
    //     type: serviceType,
    //   }
    //   console.log(newService)
    //   addMutation.mutate(newService, {
    //     onSuccess: () => {
    //       toast.success('Service added successfully');
    //     },
    //     onError: (error) => {
    //       toast.error(`Failed to add service: ${error.message}`);
    //     }
    //   });
    // }

    const handleSave = () => {
        const serviceData = {
          name: serviceName,
          type: serviceType,
        };
    
        if (mode === 'edit' && initialData) {
          updateMutation.mutate({
            id: initialData.id,
            service: serviceData,
          }, mutationCallbacks);
        } else {
          addMutation.mutate(serviceData, mutationCallbacks);
        }
      };

      const mutationCallbacks = {
        onSuccess: () => {
          toast.success(`Service ${mode === "add" ? "added" : "updated"} successfully`);
          close();
        },
        onError: (error: any) => {
          toast.error(`Failed to ${mode === "add" ? "add" : "update"} service: ${error.message}`);
        },
      };



    return (
      <Dialog open={isOpen} onOpenChange={close}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{mode === "add" ? "Add Service" : "Edit Service"}</DialogTitle>
            <DialogDescription>
            {mode === "add"
              ? "Fill in the details to create a new service."
              : "Modify the details of the service."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="name" className="sr-only">
                Name
              </Label>
              <Input
                onChange={(e) => setServiceName(e.target.value)}
                id="name"
                placeholder="Service Name"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="type" className="sr-only">
                Type
              </Label>
              <Input
                onChange={(e) => setServiceType(e.target.value as serviceType)}
                id="type"
                placeholder="Service Type"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200"
              onClick={() => handleSave()}>
                {mode === "add" ? "Add" : "Update"}
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }