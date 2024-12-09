import React, { FC, useMemo } from "react";
import { Body, CloseButton, Header, Item, Root } from "./styles";
import { CloseIcon } from "../../../icons/CloseIcon";

interface IProps {
  activeItemIndex: number;
  onItemClick: (index: number) => void;
  onClose: () => void;
  itemsNumber: number;
}

export const Navigation: FC<IProps> = ({
  activeItemIndex,
  onItemClick,
  onClose,
  itemsNumber,
}) => {
  const items = useMemo(
    () => Array.from(Array(itemsNumber).keys()),
    [itemsNumber],
  );

  return (
    <Root>
      <Header>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </Header>

      <Body>
        {items.map((item) => (
          <Item
            onClick={() => onItemClick(item)}
            isActive={item === activeItemIndex}
            key={item}
          >{`Пример №${item + 1}`}</Item>
        ))}
      </Body>
    </Root>
  );
};
