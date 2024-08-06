import uniqueId from 'lodash/uniqueId';
import styled from 'styled-components';
import Word from './components/word';

type WordsProps = {
  phrase: string;
  shouldAnimate: boolean;
  delay: number;
  duration: number;
};

const Words = ({ phrase, shouldAnimate, delay, duration }: WordsProps) => {
  return (
    <WordsContainer>
      {phrase.split(' ').map((word, index) => {
        return (
          <Word key={uniqueId()} index={index} shouldAnimate={shouldAnimate} delay={delay} duration={duration}>
            {word}
          </Word>
        );
      })}
    </WordsContainer>
  );
};

const WordsContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
`;

export default Words;
