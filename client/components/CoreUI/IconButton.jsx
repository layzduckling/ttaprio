import React from "react";
import { Button as BaseButton } from "@mui/base";

const IconButton = React.forwardRef((props, ref) => {
  return (
    <BaseButton
      {...props}
      ref={ref}
      slotProps={{
        root: {
          className:
            "flex justify-center items-center h-[32px] w-[32px] rounded-full bg-cool-white hover:bg-slate-200 hover:duration-200 disabled:hover:bg-transparent",
        },
      }}
    ></BaseButton>
  );
});

export default IconButton;
