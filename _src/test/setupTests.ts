import React from 'react';
import '@testing-library/jest-dom';
import 'jest-axe/extend-expect';

(globalThis as typeof globalThis & {React: typeof React}).React = React;
