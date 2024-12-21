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
  background-color: #d3d3d3;
`;

export const Header = styled.div`
  flex-shrink: 0;
  position: relative;
  padding: 16px;
`;

export const CloseButton = styled.div`
  width: ${HEADER_HEIGHT_PX}px;
  height: ${HEADER_HEIGHT_PX}px;
  cursor: pointer;
`;

export const Body = styled.div`
  height: 100%;
  overflow: auto;
`;

export const Item = styled.div<{
  isActive: boolean;
}>`
  padding: 16px;
  background-color: ${({ isActive }) => (isActive ? "#89CFF0" : "#F0F8FF")};
  cursor: pointer;
`;
