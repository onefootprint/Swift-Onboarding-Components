import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  .fp-input  {
    font-family: inherit;
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 150%;
    height: 40px;
    padding-left: 16px;
    padding-right: 16px;
    background: rgb(255, 255, 255);
    border-color: rgb(212, 212, 212);
    border-radius: 6px;
    border-style: solid;
    border-width: 1px;
    color: rgb(0, 0, 0);
    outline: none;
    width: 100%;

    &:hover {
      background: rgb(255, 255, 255);
      border-color: rgb(169, 169, 169);
      box-shadow: none;
    }

    &:focus {
      background: rgb(255, 255, 255);
      border-color: rgb(74, 36, 219);
      box-shadow: rgba(74, 36, 219, 0.12) 0px 0px 0px 4px;
    }

    &[aria-invalid='true'] {
      background: rgb(255, 255, 255);
      border-color: rgb(191, 20, 10);
      box-shadow: rgba(191, 20, 10, 0.12) 0px 0px 0px 4px;

      &:hover {
        background: rgb(255, 255, 255);
        border-color: rgb(153, 16, 8);
        box-shadow: none;
      }

      &:focus {
        background: rgb(255, 255, 255);
        border-color: rgb(191, 20, 10);
        box-shadow: rgba(191, 20, 10, 0.12) 0px 0px 0px 4px;
      }
    }
  }

  .fp-pin-input {
    width: 40px;
    height: 44px;
    padding: 0;
    text-align: center;
  }

  .fp-input-active {
    background: rgb(255, 255, 255);
    border-color: rgb(74, 36, 219);
    box-shadow: rgba(74, 36, 219, 0.12) 0px 0px 0px 4px;
  }

  .fp-select {
    font-family: inherit;
    font-size: 0.9375rem;
    font-weight: 400;
    line-height: 150%;
    border-color: rgb(212, 212, 212);
    border-radius: 6px;
    border-style: solid;
    border-width: 1px;
    color: rgb(0, 0, 0);
    height: 40px;
    outline: none;
    padding-inline: 12px;
    resize: none;
    width: 100%;

    &:hover {
      background: rgb(255, 255, 255);
      border-color: rgb(169, 169, 169);
      box-shadow: none;
    }

    &:focus {
      background: rgb(255, 255, 255);
      border-color: rgb(74, 36, 219);
      box-shadow: rgba(74, 36, 219, 0.12) 0px 0px 0px 4px;
    }

    &[aria-invalid='true'] {
      background: rgb(255, 255, 255);
      border-color: rgb(191, 20, 10);
      box-shadow: rgba(191, 20, 10, 0.12) 0px 0px 0px 4px;

      &:hover {
        background: rgb(255, 255, 255);
        border-color: rgb(153, 16, 8);
        box-shadow: none;
      }

      &:focus {
        background: rgb(255, 255, 255);
        border-color: rgb(191, 20, 10);
        box-shadow: rgba(191, 20, 10, 0.12) 0px 0px 0px 4px;
      }
    }
  }

  .fp-label {
    margin-bottom: 8px;
    display: block;
  }

  .fp-field-errors {
    font-family: inherit;
    font-weight: 400;
    font-size: 0.9375rem;
    line-height: 150%;
    margin-top: 4px;
    color: rgb(153, 16, 8);
  }

  .fp-address-container {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
`;

export default GlobalStyles;
