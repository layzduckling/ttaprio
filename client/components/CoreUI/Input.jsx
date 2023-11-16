import React from "react";
import { Input as BaseInput, TextareaAutosize } from "@mui/base";

const Input = React.forwardRef((props, ref) => {
  return (
    <BaseInput
      {...props}
      ref={ref}
      className="w-full"
      slots={{
        textarea: TextareaAutosize,
      }}
      slotProps={{
        input: {
          className:
            "w-full px-2 py-[2px] rounded-xl text-base disabled:bg-slate-300",
        },
      }}
    />
  );
});

export default Input;
