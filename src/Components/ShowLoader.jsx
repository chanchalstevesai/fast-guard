import { useState } from "react";

export const useProcessing = () => {
    const [processing, setProcessing] = useState(false);

    return { processing, setProcessing };
};
