<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { io, type Socket } from 'socket.io-client';
    import { socket as socketStore } from '$lib/stores/socketStore';
    
  
    let socket: Socket | null = null;
  
    onMount(() => {
      console.log('Root layout mounted, attempting socket connection...');
      // Connect to the server running locally
      socket = io('http://localhost:3000'); // Ensure this is your server address
  
      socket.on('connect', () => {
        if (socket) {
          console.log(`[Socket Client] Connected to server! My ID: ${socket.id}`);
          // TODO: Store socket instance or ID in a Svelte store if needed globally
          // Example: socketStore.set(socket);
          socketStore.set(socket); 
        }
      });
  
      socket.on('disconnect', () => {
        console.log('[Socket Client] Disconnected from server.');
        // TODO: Handle disconnection, maybe update store
        // Example: socketStore.set(null);
        socketStore.set(null);
      });
  
      socket.on('connect_error', (err) => {
        console.error('[Socket Client] Connection Error:', err.message);
      });
  
      // TODO: Add listeners for globally relevant events (e.g., chat messages, notifications)
    });
  
    onDestroy(() => {
      if (socket) {
        console.log('[Socket Client] Disconnecting socket...');
        socket.disconnect();
      }
    });
  </script>
  
  <slot />
  <style>
    /* Optional: Global styles for the layout */
  </style>