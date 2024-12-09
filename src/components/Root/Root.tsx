import React, { FC, useMemo, useState } from "react";
import { Container, OpenNavigationButton } from "./styles";
import { Example1 } from "../Example1/Example1";
import { Navigation } from "./Navigation/Navigation";

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
          Навигация
        </OpenNavigationButton>
      )}

      <Example />
    </Container>
  );
};
