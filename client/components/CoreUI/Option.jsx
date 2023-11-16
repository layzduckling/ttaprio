import React from "react";
import { Option as BaseOption } from "@mui/base";

const Option = React.forwardRef((props, ref) => {
  return (
    <BaseOption
      ref={ref}
      {...props}
      slotProps={{
        root: {
          className:
            "px-2 py-1 rounded-lg hover:bg-[#91c8E4] hover:duration-100 color-cool-white text-2xl font-bold",
        },
      }}
    ></BaseOption>
  );
});

export default Option;
