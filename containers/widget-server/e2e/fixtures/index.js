/*
 * Copyright 2022 Nordeck IT + Consulting GmbH
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const el = document.getElementById('environment');
try {
  el.innerText = JSON.stringify(
    JSON.parse(window.atob(window.__ENVIRONMENT__))
  );
} catch {
  el.innerText = 'Could not find the environment :-(';
}

// check if we are allowed to create a new script tag
const script = document.createElement('script');
script.nonce = window.NONCE;
script.text =
  "document.getElementById('webpack').innerText = 'NONCE is working!'";
document.body.appendChild(script);
