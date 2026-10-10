import sdk from "@stackblitz/sdk";
import { useEffect, useId, useRef } from "react";

export const StackblitzEmbed = (props: { projectID: string }) => {
  // 複数同時に描画しても衝突しない一意のID
  const id = `stackblitz-embed-${useId().replace(/:/g, "")}`;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // WebContainers(プレビュー)に必要。SDKは既存のiframeをそのまま利用するため、
    // allow属性を事前に付与しておけば再レンダリング不要
    iframe.setAttribute("allow", "cross-origin-isolated");

    sdk
      .embedProjectId(iframe, props.projectID, {
        openFile: "package.json",
        view: "preview",
      })
      .catch((e) => {
        console.error(e);
      });
  }, [props.projectID]);

  return <iframe id={id} ref={iframeRef} title="Stackblitz embed" allow="cross-origin-isolated" />;
};
