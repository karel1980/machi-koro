/*
 * Copyright 2017 The boardgame.io Authors
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import Server from 'boardgame.io/server';
import MachiKoro from './machi-koro';

console.log("PORT IS NOW ", process.env.PORT);

const PORT = process.env.PORT || 8000;
const DEV = process.env.NODE_ENV === 'development';
const PROD = !DEV;

const app = Server({ games: [MachiKoro] });

app.listen(PORT, () => {
  console.log(`Serving at: http://localhost:${PORT}/`);
});

