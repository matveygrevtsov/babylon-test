import styled from "styled-components";

export const Container = styled.div`
  width: 100vw;
  height: 100vh;
  position: relative;

  & canvas {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
`;

export const OpenNavigationButton = styled.button`
  position: absolute;
  left: 16px;
  top: 16px;
  z-index: 1;
`;
