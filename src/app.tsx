import { useState } from "preact/hooks";
import "./app.css";
import type { JSX } from "preact";
import Piano from "./piano/piano";
enum Pages {
  PIANO = "Piano",
  MoreSoon = "More Soon",
}

const PagesContent: Record<Pages, () => JSX.Element> = {
  [Pages.PIANO]: Piano,
  [Pages.MoreSoon]: () => <></>,
};

export function App() {
  const [currentPage, setCurrentPage] = useState<Pages>(Pages.PIANO);
  const CurrentPageComponent = PagesContent[currentPage];
  return (
    <>
      <section id="hero" className={"mt-1 flex justify-center"}>
        <div className="gap-2 flex">
          {Object.values(Pages).map((page) => (
            <button
              className={`border p-2 rounded-xl ${currentPage === page ? "bg-emerald-200" : ""}`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
        </div>
      </section>

      <section id="center">
        <CurrentPageComponent />
      </section>
      <div class="ticks"></div>
      <section id="spacer"></section>
    </>
  );
}
