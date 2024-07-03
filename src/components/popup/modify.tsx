import { Button } from "@/components/ui/button";
import { DialogClose, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { AiOutlineClose } from "react-icons/ai";

function PopupModify() {
  return (
    <DialogContent className="bg-card border-none p-2 md:p-4">
      <div className="p-5 rounded-lg flex flex-col space-y-5">
        <div className="flex items-center justify-between">
          <h1>Modify</h1>
          <DialogClose>
            <AiOutlineClose />
          </DialogClose>
        </div>
        <div>
          <h3 className="text-card-foreground">Trigger Price</h3>
          <div className="flex items-center space-x-5 bg-card pb-3 mt-3 border-b">
            <Input
              placeholder="Input trigger price"
              className="bg-transparent outline-none border-none underline-none pl-0"
            />
            <h3>USD</h3>
          </div>
        </div>
        <div>
          <h3 className="text-card-foreground">Amount</h3>
          <div className="flex items-center space-x-5 bg-card pb-3 mt-3 border-b">
            <Input
              placeholder="Input amount"
              className="bg-transparent outline-none border-none underline-none pl-0"
            />
            <h3>BTC</h3>
          </div>
        </div>
        <div className="flex justify-end space-x-3">
          <DialogClose>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button>Confirm</Button>
        </div>
      </div>
    </DialogContent>
  );
}

export default PopupModify;
