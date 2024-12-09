import React, { FC, useMemo } from "react";
import { Body, CloseButton, Header, Item, Root } from "./styles";

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
    [itemsNumber]
  );

  return (
    <Root>
      <Header>
        <CloseButton onClick={onClose}>Закрыть</CloseButton>
      </Header>

      <Body>
        {items.map((item) => (
          <Item
            onClick={() => onItemClick(item)}
            isActive={item === activeItemIndex}
            key={item}
          >{`Пример №${item}`}</Item>
        ))}
      </Body>
    </Root>
  );
};
