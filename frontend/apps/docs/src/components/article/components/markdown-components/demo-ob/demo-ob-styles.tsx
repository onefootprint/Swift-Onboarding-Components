import { createGlobalStyle } from 'styled-components';

const GlobalStyles = createGlobalStyle`
  .fp-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

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

  .fp-button {
    font-family: inherit;
    font-size: 0.9375rem;
    font-weight: 500;
    line-height: 150%;
    align-items: center;
    display: flex;
    justify-content: center;
    position: relative;
    user-select: none;
    cursor: pointer;
    outline-offset: 4px;
    background-color: rgb(74, 36, 219);
    color: rgb(255, 255, 255);
    border-style: solid;
    border-width: 1px;
    border-color: rgb(58, 28, 170);
    border-radius: 6px;
    height: 40px;
    padding: 0px 24px;
    box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 2px 0px, rgba(200, 200, 200, 0.2) 0px -1px 1px inset, rgba(255, 255, 255, 0.2) 0px 1px 1px inset;
    transition: background-color 0.1s ease-in-out 0s;
  }
`;

export default GlobalStyles;
