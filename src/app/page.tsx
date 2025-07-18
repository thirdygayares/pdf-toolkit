"use client"



import {Button} from "@/components/ui/button";
import {useRouter} from "next/navigation";

export default function HomePage() {

    const router = useRouter();

    const handleGotoMergePdf = () => {
        router.push("/merge-pdf");
    };

  return (
      <div className="min-h-screen flex justify-center place-items-center bg-gray-50">
          <Button onClick={handleGotoMergePdf}>
                Go to Merge PDF
          </Button>
      </div>
  )
}
