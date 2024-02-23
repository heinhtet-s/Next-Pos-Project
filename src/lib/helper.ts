import html2canvas from "html2canvas";
import { useReactToPrint } from "react-to-print";

export const TodayDate = () => {
  const date = new Date();
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  let month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  let day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  return day + "-" + month + "-" + year;
};
export const TodayDateTime = () => {
  const date = new Date();
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  let month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  let day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  let time = new Intl.DateTimeFormat("en-US", {
    hour12: true,
    hour: "numeric",
    minute: "numeric",
  }).format(date);
  return day + "-" + month + "-" + year + " " + time;
};

export const formatDate = (data: Date) => {
  let date = new Date(data);
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  let month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  let day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  // return  day+"-"+month+"-"+year;
  let payload = day + "-" + month + "-" + year;
  return payload;
};

export const formatMonth = (data: Date) => {
  let date = new Date(data);
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  let month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  // return  day+"-"+month+"-"+year;
  let payload = month + "-" + year;
  return payload;
};
export const formatYear = (data: Date) => {
  let date = new Date(data);
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  // return  day+"-"+month+"-"+year;
  let payload = year;
  return payload;
};

export const getDay = () => {
  const date = new Date();
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  let month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  let day = new Intl.DateTimeFormat("en", { day: "2-digit" }).format(date);
  let payload = day + "-" + month + "-" + year;
  return payload;
};
export const getMonth = () => {
  const date = new Date();
  let month = new Intl.DateTimeFormat("en", { month: "short" }).format(date);
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  let payload = month + "-" + year;
  return payload;
};
export const getYear = () => {
  const date = new Date();
  let year = new Intl.DateTimeFormat("en", { year: "numeric" }).format(date);
  let payload = year;
  return payload;
};

export const ExportPhothHandler = async (
  VouncherRef: HTMLDivElement | null
) => {
  console.log("printing..");
  if (!VouncherRef) return;
  const el = VouncherRef;

  const options: any = {
    type: "dataURL",
  };
  const printCanvas = await html2canvas(el, options);

  const link = document.createElement("a");
  link.setAttribute("download", `fwef.png`);
  link.setAttribute(
    "href",
    printCanvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream")
  );
  link.click();

  console.log("done");
};
