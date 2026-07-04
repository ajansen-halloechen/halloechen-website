<script setup lang="ts">
import GoogleMapEmbed from './GoogleMapEmbed.vue';
</script>

<template>
  <div class="w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
    <div class="space-y-6">
      <h3 class="text-xl font-semibold">Raum:</h3>
      <div class="w-full max-w-xl aspect-[4/3]">
        <GoogleMapEmbed
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2427.183252228707!2d13.328274877647784!3d52.53011853547905!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47a851af3f3a5f61%3A0x9703c9045c49ca3a!2sHall%C3%B6chen!5e0!3m2!1sde!2sde!4v1768928723404!5m2!1sde!2sde"
        />
      </div>
    </div>
    <div class="space-y-6">
      <h3 class="text-xl font-semibold">Zeit:</h3>
      <table class="border-collapse max-w-xs gap-1">
        <tbody>
          <tr>
            <td class="pr-2 align-top whitespace-nowrap">Donnerstag:</td>
            <td class="tabular-nums align-top whitespace-nowrap">
              18:00&nbsp;bis&nbsp;01:00&nbsp;Uhr
            </td>
          </tr>
          <tr>
            <td class="pr-2 align-top whitespace-nowrap">Freitag:</td>
            <td class="tabular-nums align-top whitespace-nowrap">
              18:00&nbsp;bis&nbsp;Schluss
            </td>
          </tr>
          <tr>
            <td class="pr-2 align-top whitespace-nowrap">Samstag:</td>
            <td class="tabular-nums align-top whitespace-nowrap">
              18:00&nbsp;bis&nbsp;Schluss
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
