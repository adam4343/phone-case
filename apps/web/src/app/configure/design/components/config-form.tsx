import { Button } from "@/components/ui/button";
import ColorSelect from "./colors-select";
import MaterialSelect from "./material-select";
import ModelSelect from "./model-select";
import { useFormContext } from "react-hook-form";

export default function  ConfigForm() {
    const { watch, formState: { isValid } } = useFormContext();
    return <form className="flex flex-col gap-6">
        
        <ColorSelect />
        <ModelSelect />
        <MaterialSelect />

    </form>
}