import { useState } from "react";
import { DataItem } from "../models/globalContext";

export default function useTabsContent(contentData: DataItem) {
  const [content, setContent] = useState<DataItem>(contentData)

  const onChangeContent = (key: string, value: any) => {
    setContent(prev => ({ ...prev, ...{ [key]: value } }))
  }

  return { content, onChangeContent }
}