import styled from "styled-components";

const HEADER_HEIGHT_PX = 48;

export const Root = styled.div`
  width: 100%;
  max-width: 400px;
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  z-index: 1;
  background-color: gray;
`;

export const Header = styled.div`
  flex-shrink: 0;
  height: ${HEADER_HEIGHT_PX}px;
  position: relative;
`;

export const CloseButton = styled.button`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translate(0, -50%);
`;

export const Body = styled.div`
  height: 100%;
  overflow: auto;
`;

export const Item = styled.div<{
  isActive: boolean;
}>`
  padding: 16px;

  background-color: ${({ isActive }) => (isActive ? "blue" : "gray")};
`;
