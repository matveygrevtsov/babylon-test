import React, { FC, useMemo, useState } from "react";
import { Container, OpenNavigationButton } from "./styles";
import { Example1 } from "../Example1/Example1";
import { Navigation } from "./Navigation/Navigation";
import { BarsIcon } from "../../icons/BarsIcon";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import "@babylonjs/loaders";

interface IState {
  index: number;
  isNavigationOpened: boolean;
}

const INITIAL_STATE: IState = {
  index: 0,
  isNavigationOpened: false,
};

const EXAMPLES: FC[] = [Example1];

export const Root = () => {
  const [state, setState] = useState<IState>(INITIAL_STATE);

  const Example = useMemo(() => EXAMPLES[state.index], [state.index]);

  const handleNavigationItemClick = (index: number) => {
    setState((prevState) => ({
      ...prevState,
      index,
    }));
  };

  const handleNavigationToggle = () => {
    setState((prevState) => ({
      ...prevState,
      isNavigationOpened: !prevState.isNavigationOpened,
    }));
  };

  switch (EXAMPLES.length) {
    case 0:
      return null;
    case 1:
      return (
        <Container>
          <Example />
        </Container>
      );
    default:
      return (
        <Container>
          {state.isNavigationOpened ? (
            <Navigation
              activeItemIndex={state.index}
              onItemClick={handleNavigationItemClick}
              onClose={handleNavigationToggle}
              itemsNumber={EXAMPLES.length}
            />
          ) : (
            <OpenNavigationButton onClick={handleNavigationToggle}>
              <BarsIcon />
            </OpenNavigationButton>
          )}

          <Example />
        </Container>
      );
  }
};
