import * as React from "react";
import { Slider as BaseSlider } from "@mui/base/Slider";

const SliderValueLabel = ({ children }) => {
  return (
    <span>
      <div className="absolute -top-6 color-dark">{children}</div>
    </span>
  );
};

const Slider = React.forwardRef((props, ref) => {
  return (
    <BaseSlider
      defaultValue={10}
      slots={{ valueLabel: SliderValueLabel }}
      slotProps={{
        root: {
          className: "block relative w-full h-full py-3 color-dark-blue",
        },
        track: {
          className: "absolute h-1 bg-dark-blue rounded-lg"
        },
        rail: {
          className: "absolute w-full h-1 bg-grey rounded-lg",
        },
        thumb: {
          className: "absolute w-4 h-4 -ml-[6px] -mt-[6px] bg-dark-blue rounded-full",
        },
      }}
      {...props}
      ref={ref}
    />
  );
});
export default Slider;
