"use client";

import { Button } from "@/components/ui/button";
import { Sparkles, Loader2 } from "lucide-react";
import { generateMockData } from "@/actions/seed";
import { useState } from "react";

export function GenerateDemoButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await generateMockData();
      window.location.reload();
    } catch (error) {
      console.error("Failed to generate demo data:", error);
      alert("Failed to generate demo data. Make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={loading}
      className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:from-blue-600 hover:to-indigo-700 text-sm h-9">
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Sparkles className="w-4 h-4 mr-2" />
      )}
      {loading ? "Generating..." : "Generate Demo Data"}
    </Button>
  );
}
