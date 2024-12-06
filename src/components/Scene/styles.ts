import styled from "styled-components";

export const Root = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;
`;

export const Canvas = styled.canvas`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
`;
