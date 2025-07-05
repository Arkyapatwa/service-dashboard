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
  import { Plus } from "lucide-react"
  import { addService as useAddService } from "@/hooks/useService"
  import { toast } from 'sonner'
  import { useState } from "react"
  import { serviceType } from "@/hooks/useService"

  
  export function AddServiceDialog() {
    const [serviceName, setServiceName] = useState('')
    const [serviceType, setServiceType] = useState<serviceType>()

    const mutation = useAddService()
    const handleAddService = () => {
        
      const newService = {
        name: serviceName,
        type: serviceType,
      }
      console.log(newService)
      mutation.mutate(newService, {
        onSuccess: () => {
          toast.success('Service added successfully');
        },
        onError: (error) => {
          toast.error(`Failed to add service: ${error.message}`);
        }
      });
    }

    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg transition-all duration-200" 
        //   variant="outline"
          ><Plus className="w-4 h-4 mr-2" /> Add Service </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Service Details</DialogTitle>
            <DialogDescription>
              Fill in the details of the service you want to add.
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
              onClick={() => handleAddService()}>
                Add
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }