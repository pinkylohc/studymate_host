
import Tour from 'reactour';

interface TourComponentProps {
  steps: any[];
  isTourOpen: boolean;
  onRequestClose: () => void;
}

const TourComponent = ({ steps, isTourOpen, onRequestClose }: TourComponentProps) => {
  return (
    <Tour
      steps={steps}
      isOpen={isTourOpen}
      onRequestClose={onRequestClose}
      accentColor="#5cb85c"
      rounded={5}
      showNumber={true}
      showNavigation={true}
      showNavigationNumber={true}
      showButtons={true}
      showCloseButton={true}
      startAt={0}
    />
  );
};

export default TourComponent;