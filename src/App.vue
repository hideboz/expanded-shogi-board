<!-- Main Component.
    Copyright (C) 2023 Hideaki Sakai
    
    This file is part of Expanded-Shogi-Board.
    
    Expanded-Shogi-Board is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
    
    Expanded-Shogi-Board is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.
    
    You should have received a copy of the GNU Affero General Public License
    along with Expanded-Shogi-Board.  If not, see <https://www.gnu.org/licenses/>.
-->

<script setup lang="ts">
import TheBoard from './components/TheBoard.vue'

</script>

<template>
    <nav class="navbar navbar-expand-lg py-3 mb-3" style="background-color: #8b968d;">
        <div class="container">
            <a class="navbar-brand" href="#">
                <h2>ちょっと便利な将棋盤</h2>
            </a>

            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item dropdown">
                        <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                            aria-expanded="false"><strong>連絡先</strong></a>
                        <ul class="dropdown-menu">
                            <li><a class="dropdown-item" href="https://twitter.com/crestboz" target="_blank"><img
                                        src="../public/crestboz.jpg" class="img-thumbnail mx-auto d-block"
                                        alt="@crestboz"></a></li>
                        </ul>
                    </li>
                </ul>

            </div>

        </div>
    </nav>

    <TheBoard />
</template>

<style scoped></style>
