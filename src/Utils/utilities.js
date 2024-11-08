import { BsFillPersonBadgeFill } from "react-icons/bs";
import { FaAlignLeft, FaBriefcase, FaCalendar, FaCertificate, FaCheckSquare, FaEraser, FaSignature, FaTextWidth, FaUser } from "react-icons/fa";

export const notaryActionsList = [
  {
    actionName: 'Text',
    actionIcon: FaTextWidth,
    elementName: 'text',
    imagePath: '',
  },
  {
    actionName: 'Name',
    actionIcon: FaUser,
    elementName: 'name',
    imagePath: '',
  },
  {
    actionName: 'Title',
    actionIcon: FaBriefcase,
    elementName: 'title',
    imagePath: '',
  },
  {
    actionName: 'Commission ID',
    actionIcon: BsFillPersonBadgeFill,
    elementName: 'commission_id',
    imagePath: '',
  },
  {
    actionName: 'Commission Exp Date',
    actionIcon: FaCalendar,
    elementName: 'commission_exp_date',
    imagePath: '',
  },
  {
    actionName: 'Seal',
    actionIcon: FaCertificate,
    elementName: 'seal',
    elementType: 'image',
  },
  {
    actionName: 'Disclosure',
    actionIcon: FaAlignLeft,
    elementName: 'disclosure',
  },
  {
    actionName: 'Signature',
    actionIcon: FaSignature,
    elementName: 'signature',
    elementType: 'image',
  },
  {
    actionName: 'Initial',
    actionIcon: FaTextWidth,
    elementName: 'initial',
    elementType: 'image',
  },
  {
    actionName: 'Date',
    actionIcon: FaCalendar,
    elementName: 'date',
    imagePath: '',
  },
  {
    actionName: 'Checkbox',
    actionIcon: FaCheckSquare,
    elementName: 'checkbox',
    elementType: 'image',
  },
  {
    actionName: 'White Out',
    actionIcon: FaEraser,
    elementName: 'whitebox',
    elementType: 'image',
  },
];
