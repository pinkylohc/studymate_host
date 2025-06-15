import FileExport from "./file_export";
import SummaryCardHeader from "./card_header";
import Timer from "../timer";
import ProgressBar from "@ramonak/react-progress-bar";
import AnsweredQuestionsList from "./answered_list";
import { motion } from 'framer-motion';
import { HiOutlineDocumentText, HiOutlineClock, HiOutlineChartBar, HiOutlineClipboardCheck } from "react-icons/hi";

interface quizsideprop {
    contentstr: string;
    input: any;
    createTime: Date;
    quizStatus: 'notStarted' | 'started' | 'submitted' | 'timeOut';
    setQuizStatus: (status: 'notStarted' | 'started' | 'submitted' | 'timeOut') => void;
    progress: number;
    answeredArray: boolean[];
}

export default function QuizSide({ quizsideprop }: { quizsideprop: quizsideprop }) {
  const { contentstr, input, createTime, quizStatus, setQuizStatus, progress, answeredArray } = quizsideprop;

  const handleStartClick = () => {
    setQuizStatus('started');
  };

  const handleRestartClick = () => {
    setQuizStatus('notStarted');
  };

  const handleTimeOut = () => {
    setQuizStatus('timeOut');
  };

  return (
    <div className="flex flex-col h-full divide-y divide-gray-200/75">            
        <div className="p-6">
          <SummaryCardHeader info={{input: input, type: "Quiz:", createTime: createTime}}/>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <HiOutlineDocumentText className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-700">Export Quiz</h3>
          </div>
          <FileExport exportcontent={{contentstr: contentstr, type: 'quiz'}}/> 
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <HiOutlineClock className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-700">Time Remaining</h3>
          </div>
          <Timer onStart={handleStartClick} onRestart={handleRestartClick} onTimeOut={handleTimeOut} />
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3">
            <HiOutlineChartBar className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-700">Quiz Progress</h3>
          </div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ProgressBar 
              completed={progress} 
              maxCompleted={100}
              customLabel={`${progress.toFixed(1)}%`}
              height="12px"
              borderRadius="6px"
              baseBgColor="#f3f4f6"
              bgColor="#3b82f6"
              labelSize="11px"
              labelAlignment="center"
              labelColor="#fff"
              transitionDuration="0.3s"
              animateOnRender
              className="shadow-sm"
            />
          </motion.div>
        </div>
        
        <div className="p-6 flex-1 min-h-0">
          <div className="flex items-center space-x-3 mb-4">
            <HiOutlineClipboardCheck className="w-5 h-5 text-gray-400" />
            <h3 className="font-medium text-gray-700">Question Status</h3>
          </div>
          <div className="overflow-y-auto h-full">
            <AnsweredQuestionsList answeredArray={answeredArray} />
          </div>
        </div>
    </div>
  );
}