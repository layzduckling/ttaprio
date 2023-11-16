import React from "react";
import { Select as BaseSelect } from "@mui/base";

import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";

const Select = React.forwardRef((props, ref) => {
  const SelectButton = React.forwardRef((p, r) => {
    return (
      <button
        {...p}
        ref={r}
        className="flex justify-between items-center px-2 rounded-xl bg-slate-200 hover:bg-slate-300 hover:duration-100 disabled:bg-slate-300"
      >
        <div id="button-text">{p.children}</div>
        <UnfoldMoreIcon fontSize="small" />
      </button>
    );
  });

  return (
    <BaseSelect
      ref={ref}
      {...props}
      slots={{
        root: SelectButton,
      }}
      slotProps={{
        listbox: {
          className: "my-1 rounded-xl bg-[#7498c2]",
        },
      }}
    ></BaseSelect>
  );
});

export default Select;
