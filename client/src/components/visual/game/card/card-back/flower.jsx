import "../../../../../styles/flower.css";
import { useContext } from "react";
import flowerSvg from "../../../../../assets/flowers.svg";
import CardStyleContext from "../../../../../context/card-style-context.js";

function Flower({
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
      className={`${size} ${bgClass} rounded-xl shadow-lg flower-card-back${animated ? " animate" : ""}`}
    >
      {animated ? (
        <div className="flowers flowers--card">
          <div key="flower-1" className="flower flower--1">
            <div className="flower-leafs flower-leafs--1">
              <div key="leaf-1" className="flower-leaf flower-leaf--1"></div>
              <div key="leaf-2" className="flower-leaf flower-leaf--2"></div>
              <div key="leaf-3" className="flower-leaf flower-leaf--3"></div>
              <div key="leaf-4" className="flower-leaf flower-leaf--4"></div>
              <div key="white-circle" className="flower-white-circle"></div>
              {/* lights*/}
              <div key="light-1" className="flower-light flower-light--1"></div>
              <div key="light-2" className="flower-light flower-light--2"></div>
              <div key="light-3" className="flower-light flower-light--3"></div>
              <div key="light-4" className="flower-light flower-light--4"></div>
              <div key="light-5" className="flower-light flower-light--5"></div>
              <div key="light-6" className="flower-light flower-light--6"></div>
              <div key="light-7" className="flower-light flower-light--7"></div>
              <div key="light-8" className="flower-light flower-light--8"></div>
            </div>
            <div key="line-1" className="flower-line">
              <div
                key="line-leaf-1"
                className="flower-line-leaf flower-line-leaf--1"
              ></div>
              <div
                key="line-leaf-2"
                className="flower-line-leaf flower-line-leaf--2"
              ></div>
              <div
                key="line-leaf-3"
                className="flower-line-leaf flower-line-leaf--3"
              ></div>
              <div
                key="line-leaf-4"
                className="flower-line-leaf flower-line-leaf--4"
              ></div>
              <div
                key="line-leaf-5"
                className="flower-line-leaf flower-line-leaf--5"
              ></div>
              <div
                key="line-leaf-6"
                className="flower-line-leaf flower-line-leaf--6"
              ></div>
            </div>
          </div>
          <div key="flower-2" className="flower flower--2">
            <div className="flower-leafs flower-leafs--2">
              <div key="leaf-1" className="flower-leaf flower-leaf--1"></div>
              <div key="leaf-2" className="flower-leaf flower-leaf--2"></div>
              <div key="leaf-3" className="flower-leaf flower-leaf--3"></div>
              <div key="leaf-4" className="flower-leaf flower-leaf--4"></div>
              <div key="white-circle" className="flower-white-circle"></div>
              <div key="light-1" className="flower-light flower-light--1"></div>
              <div key="light-2" className="flower-light flower-light--2"></div>
              <div key="light-3" className="flower-light flower-light--3"></div>
              <div key="light-4" className="flower-light flower-light--4"></div>
              <div key="light-5" className="flower-light flower-light--5"></div>
              <div key="light-6" className="flower-light flower-light--6"></div>
              <div key="light-7" className="flower-light flower-light--7"></div>
              <div key="light-8" className="flower-light flower-light--8"></div>
            </div>
            <div key="line-2" className="flower-line">
              <div
                key="line-leaf-1"
                className="flower-line-leaf flower-line-leaf--1"
              ></div>
              <div
                key="line-leaf-2"
                className="flower-line-leaf flower-line-leaf--2"
              ></div>
              <div
                key="line-leaf-3"
                className="flower-line-leaf flower-line-leaf--3"
              ></div>
              <div
                key="line-leaf-4"
                className="flower-line-leaf flower-line-leaf--4"
              ></div>
            </div>
          </div>
          <div key="flower-3" className="flower flower--3">
            <div className="flower-leafs flower-leafs--3">
              <div key="leaf-1" className="flower-leaf flower-leaf--1"></div>
              <div key="leaf-2" className="flower-leaf flower-leaf--2"></div>
              <div key="leaf-3" className="flower-leaf flower-leaf--3"></div>
              <div key="leaf-4" className="flower-leaf flower-leaf--4"></div>
              <div key="white-circle" className="flower-white-circle"></div>
              <div key="light-1" className="flower-light flower-light--1"></div>
              <div key="light-2" className="flower-light flower-light--2"></div>
              <div key="light-3" className="flower-light flower-light--3"></div>
              <div key="light-4" className="flower-light flower-light--4"></div>
              <div key="light-5" className="flower-light flower-light--5"></div>
              <div key="light-6" className="flower-light flower-light--6"></div>
              <div key="light-7" className="flower-light flower-light--7"></div>
              <div key="light-8" className="flower-light flower-light--8"></div>
            </div>
            <div key="line-3" className="flower-line">
              <div
                key="line-leaf-1"
                className="flower-line-leaf flower-line-leaf--1"
              ></div>
              <div
                key="line-leaf-2"
                className="flower-line-leaf flower-line-leaf--2"
              ></div>
              <div
                key="line-leaf-3"
                className="flower-line-leaf flower-line-leaf--3"
              ></div>
              <div
                key="line-leaf-4"
                className="flower-line-leaf flower-line-leaf--4"
              ></div>
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

export default Flower;
