import "../../../../../styles/flower.css";
import { useContext } from "react";
import CardStyleContext from "../../../../../context/card-style-context.js";
import flowerSvg from "../../../../../assets/flowers.svg";

function FlowerDark({
  card,
  forceStyle,
  size = "w-11 h-16 sm:w-14 sm:h-22 md:w-16 md:h-24",
  animated = false,
}) {
  const { getCardBgClass } = useContext(CardStyleContext);
  const bg = card?.bg;
  const bgClass = getCardBgClass(bg, forceStyle);

  return (
    <div
      className={`${size} ${bgClass} rounded-xl shadow-lg flower-card-dark-back${animated ? " animate" : ""}`}
    >
      {animated ? (
        <div className="flowers flowers--card">
          <div key="flower-1" className="flower flower--1">
            <div className="flower-leafs flower-leafs--1">
              <div className="flower-leaf flower-leaf--1"></div>
              <div className="flower-leaf flower-leaf--2"></div>
              <div className="flower-leaf flower-leaf--3"></div>
              <div className="flower-leaf flower-leaf--4"></div>
              <div className="flower-white-circle"></div>
              {/* lights*/}
              <div className="flower-light flower-light--1"></div>
              <div className="flower-light flower-light--2"></div>
              <div className="flower-light flower-light--3"></div>
              <div className="flower-light flower-light--4"></div>
              <div className="flower-light flower-light--5"></div>
              <div className="flower-light flower-light--6"></div>
              <div className="flower-light flower-light--7"></div>
              <div className="flower-light flower-light--8"></div>
            </div>
            <div className="flower-line">
              <div className="flower-line-leaf flower-line-leaf--1"></div>
              <div className="flower-line-leaf flower-line-leaf--2"></div>
              <div className="flower-line-leaf flower-line-leaf--3"></div>
              <div className="flower-line-leaf flower-line-leaf--4"></div>
              <div className="flower-line-leaf flower-line-leaf--5"></div>
              <div className="flower-line-leaf flower-line-leaf--6"></div>
            </div>
          </div>
          <div key="flower-2" className="flower flower--2">
            <div className="flower-leafs flower-leafs--2">
              <div className="flower-leaf flower-leaf--1"></div>
              <div className="flower-leaf flower-leaf--2"></div>
              <div className="flower-leaf flower-leaf--3"></div>
              <div className="flower-leaf flower-leaf--4"></div>
              <div className="flower-white-circle"></div>
              <div className="flower-light flower-light--1"></div>
              <div className="flower-light flower-light--2"></div>
              <div className="flower-light flower-light--3"></div>
              <div className="flower-light flower-light--4"></div>
              <div className="flower-light flower-light--5"></div>
              <div className="flower-light flower-light--6"></div>
              <div className="flower-light flower-light--7"></div>
              <div className="flower-light flower-light--8"></div>
            </div>
            <div className="flower-line">
              <div className="flower-line-leaf flower-line-leaf--1"></div>
              <div className="flower-line-leaf flower-line-leaf--2"></div>
              <div className="flower-line-leaf flower-line-leaf--3"></div>
              <div className="flower-line-leaf flower-line-leaf--4"></div>
            </div>
          </div>
          <div key="flower-3" className="flower flower--3">
            <div className="flower-leafs flower-leafs--3">
              <div className="flower-leaf flower-leaf--1"></div>
              <div className="flower-leaf flower-leaf--2"></div>
              <div className="flower-leaf flower-leaf--3"></div>
              <div className="flower-leaf flower-leaf--4"></div>
              <div className="flower-white-circle"></div>
              <div className="flower-light flower-light--1"></div>
              <div className="flower-light flower-light--2"></div>
              <div className="flower-light flower-light--3"></div>
              <div className="flower-light flower-light--4"></div>
              <div className="flower-light flower-light--5"></div>
              <div className="flower-light flower-light--6"></div>
              <div className="flower-light flower-light--7"></div>
              <div className="flower-light flower-light--8"></div>
            </div>
            <div className="flower-line">
              <div className="flower-line-leaf flower-line-leaf--1"></div>
              <div className="flower-line-leaf flower-line-leaf--2"></div>
              <div className="flower-line-leaf flower-line-leaf--3"></div>
              <div className="flower-line-leaf flower-line-leaf--4"></div>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-center items-center h-full">
          <img src={flowerSvg} />
        </div>
      )}
    </div>
  );
}

export default FlowerDark;
