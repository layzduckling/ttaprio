import React from "react";
import { Dropdown, MenuButton, Menu as BaseMenu } from "@mui/base";

const Menu = React.forwardRef((props, ref) => {
  const { title, baseStyle, ...other } = props;

  return (
    <Dropdown>
      <MenuButton className={baseStyle}>{title}</MenuButton>
      <BaseMenu
        {...other}
        slotProps={{
            root: {
              className: "py-1 max-h-[50%] overflow-y-scroll rounded-xl"
            },
            listbox: {
              className: "rounded-xl bg-[#7498c2] color-cool-white text-2xl font-bold",
            },
          }}
      ></BaseMenu>
    </Dropdown>
  );
});

export default Menu;
