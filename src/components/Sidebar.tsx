import { Button, Drawer } from "@geist-ui/core";
import { useState } from "react";

export const Sidebar = () => {
  const [state, setState] = useState(false);

  return (
    <div className="absolute my-20">
      <Button auto onClick={() => setState(true)}>
        Show Drawer
      </Button>
      <Drawer visible={state} onClose={() => setState(false)} placement="left" className="bg-white/10" style={{ backdropFilter: "blur(10px)" }}>
        <Drawer.Title>Drawer</Drawer.Title>
        <Drawer.Subtitle>This is a drawer</Drawer.Subtitle>
        <Drawer.Content>
          <p>Some content contained within the drawer.</p>
        </Drawer.Content>
      </Drawer>
    </div>
  );
};
