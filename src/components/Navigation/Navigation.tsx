import React, { FC } from "react";
import { Body, CloseButton, Header, Item, Root } from "./styles";
import { CloseIcon } from "../../icons/CloseIcon";
import { Link, useLocation } from "react-router-dom";
import { ROUTES } from "../../routes";

interface IProps {
  onClose: () => void;
}

export const Navigation: FC<IProps> = ({ onClose }) => {
  const location = useLocation();

  return (
    <Root>
      <Header>
        <CloseButton onClick={onClose}>
          <CloseIcon />
        </CloseButton>
      </Header>

      <Body>
        {ROUTES.map(({ pathname, title }) => (
          <Link to={pathname === "*" ? "/example1" : pathname} key={pathname}>
            <Item
              isActive={(() => {
                if (pathname === location.pathname) return true;

                if (
                  !ROUTES.some(
                    ({ pathname }) => pathname === location.pathname,
                  ) &&
                  pathname === "*"
                ) {
                  return true;
                }

                return false;
              })()}
            >
              {title}
            </Item>
          </Link>
        ))}
      </Body>
    </Root>
  );
};
