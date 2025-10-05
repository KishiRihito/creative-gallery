import sdk from "@stackblitz/sdk";
import { useEffect } from "react";

export const StackblitzEmbed = (props: { projectID: string }) => {
  useEffect(() => {
    sdk
      .embedProjectId("stackblitz-embed", props.projectID, {
        openFile: "package.json",
        view: "preview",
      })
      .then((r) => {
        console.log(r);
      })
      .catch((e) => {
        console.error(e);
      });
  }, []);

  return (
    <>
      <div id="stackblitz-embed">Embed Stackblitz editor</div>
    </>
  );
};
