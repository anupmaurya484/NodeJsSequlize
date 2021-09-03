import { config }  from '../../../utils/workflow.config';

export default function logger (...theMsgs) {
    if (config.logger && theMsgs.length) {
        theMsgs[0] = 'Argument Value: ' + theMsgs[0];
        // console.log(theMsgs.join('\r\nArgument Value: '));
    }
}
