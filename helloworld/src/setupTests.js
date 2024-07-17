import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";
import { server } from './mocks/server';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
